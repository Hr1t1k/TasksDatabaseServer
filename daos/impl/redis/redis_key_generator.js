import shortid from "shortid";
let prefix = "tasks";

const getKey = (key) => `${prefix}:${key}`;

const getTemporaryKey = () => getKey(`tmp:${shortid.generate()}`);
const getSiteHashKey = (listId) => getKey(`lists:${listId}`);
const getSiteIDsKey = (userId) => getKey(`users:lists:${userId}`);
const setPrefix = (newPrefix) => {
  prefix = newPrefix;
};

export { getTemporaryKey, getSiteHashKey, getSiteIDsKey, setPrefix, getKey };
