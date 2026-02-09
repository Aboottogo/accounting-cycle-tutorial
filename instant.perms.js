/**
 * InstantDB permissions: userProgress is scoped to the signed-in user.
 * Push with: npx instant-cli@latest push perms
 */
const rules = {
  userProgress: {
    allow: {
      view: 'isOwner',
      create: 'auth.id != null',
      update: 'isOwner',
      delete: 'isOwner',
    },
    bind: {
      isOwner: 'auth.id != null && auth.id == data.ref("$user.id")',
    },
  },
};

export default rules;
