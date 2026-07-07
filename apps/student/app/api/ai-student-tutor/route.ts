import { geminiClient } from '@eduspell/ai-core';
import { FirestoreRepository } from '@eduspell/database';
import { createId } from '@eduspell/shared';
import { NextRequest, NextResponse } from 'next/server';

type TutorRole = 'student' | 'assistant';

interface TutorMessageRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  sessionId: string;
  role: TutorRole;
  message: string;
  topic: string;
  metadata?: Record<string, unknown>;
}

interface TutorChatRequest {
  sessionId?: string;
  message: string;
  topic: string;
  gradeLevel: string;
}

function parseChatRequest(payload: unknown): TutorChatRequest {
  const source = payload as Record<string, unknown>;
  const message = String(source.message ?? '').trim();
  const topic = String(source.topic ?? '').trim();
  const gradeLevel = String(source.gradeLevel ?? '').trim();
  const sessionIdValue = source.sessionId;
  const sessionId = typeof sessionIdValue === 'string' && sessionIdValue.trim().length > 0 ? sessionIdValue.trim() : undefined;

  if (message.length < 2) {
    throw new Error('message must contain at least 2 characters.');
  }

  if (!topic) {
    throw new Error('topic is required.');
  }

  if (!gradeLevel) {
    throw new Error('gradeLevel is required.');
  }

  return {
    sessionId,
    message,
    topic,
    gradeLevel,
  };
}

function summarizeHistory(messages: TutorMessageRecord[]): Array<{ role: TutorRole; message: string }> {
  return messages
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-8)
    .map((item) => ({ role: item.role, message: item.message }));
}

export async function POST(request: NextRequest) {
  try {
    const role = request.cookies.get('eduspell_role')?.value;
    if (role !== 'student') {
      return NextResponse.json({ error: 'Only students can access AI Tutor.' }, { status: 403 });
    }

    const studentId = request.cookies.get('eduspell_uid')?.value;
    if (!studentId) {
      return NextResponse.json({ error: 'Missing authenticated student identifier.' }, { status: 401 });
    }

    const payload = parseChatRequest(await request.json());
    const sessionId = payload.sessionId || createId('tutor-session');

    const repository = new FirestoreRepository<TutorMessageRecord>('learningProgress');
    const previous = await repository.findByField('sessionId', sessionId);
    const history = summarizeHistory(previous.filter((item) => item.studentId === studentId));

    const promptPayload = {
      studentId,
      sessionId,
      topic: payload.topic,
      gradeLevel: payload.gradeLevel,
      history,
      latestQuestion: payload.message,
    };

    const aiResponse = await geminiClient.generateJson(
      {
        feature: 'ai-student-tutor-chat',
        systemPrompt:
          'You are EduSpell AI Tutor for primary learners. Return strict JSON with fields reply, followUpQuestion, keyTakeaways (string[]), and encouragement. Keep language age-appropriate and concise.',
        userPrompt: JSON.stringify(promptPayload),
        temperature: 0.35,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const reply = String(source.reply ?? '').trim();
          const followUpQuestion = String(source.followUpQuestion ?? '').trim();
          const encouragement = String(source.encouragement ?? '').trim();
          const keyTakeaways = Array.isArray(source.keyTakeaways)
            ? source.keyTakeaways.map((item) => String(item).trim()).filter((item) => item.length > 0)
            : [];

          if (!reply || keyTakeaways.length === 0 || !encouragement) {
            throw new Error('AI tutor output is incomplete.');
          }

          return {
            reply,
            followUpQuestion,
            keyTakeaways,
            encouragement,
          };
        },
      }
    );

    const now = new Date().toISOString();

    await repository.create({
      createdAt: now,
      updatedAt: now,
      studentId,
      sessionId,
      role: 'student',
      message: payload.message,
      topic: payload.topic,
      metadata: {
        gradeLevel: payload.gradeLevel,
      },
    });

    await repository.create({
      createdAt: now,
      updatedAt: now,
      studentId,
      sessionId,
      role: 'assistant',
      message: aiResponse.data.reply,
      topic: payload.topic,
      metadata: {
        followUpQuestion: aiResponse.data.followUpQuestion,
        keyTakeaways: aiResponse.data.keyTakeaways,
        encouragement: aiResponse.data.encouragement,
        model: aiResponse.model,
        promptHash: aiResponse.promptHash,
      },
    });

    return NextResponse.json({
      data: {
        sessionId,
        answer: aiResponse.data.reply,
        followUpQuestion: aiResponse.data.followUpQuestion,
        keyTakeaways: aiResponse.data.keyTakeaways,
        encouragement: aiResponse.data.encouragement,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate AI tutor response.',
      },
      { status: 400 }
    );
  }
}
