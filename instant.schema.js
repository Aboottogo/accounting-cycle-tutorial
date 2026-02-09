import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    userProgress: i.entity({
      journalEntries: i.json(),
      postedEntries: i.json(),
      version: i.number(),
    }),
  },
  links: {
    progressUser: {
      forward: { on: 'userProgress', has: 'one', label: '$user' },
      reverse: { on: '$users', has: 'one', label: 'userProgress' },
    },
  },
});

const schema = _schema;
export default schema;
