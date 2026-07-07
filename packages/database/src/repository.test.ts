import { Repository } from './repository';

describe('Repository', () => {
  it('returns an empty list for a new collection', async () => {
    const repository = new Repository<{ id: string; createdAt: string; updatedAt: string }>('students');
    const items = await repository.list();

    expect(items).toEqual([]);
  });
});
