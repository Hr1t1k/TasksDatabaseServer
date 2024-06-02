import client from "../../../config/redisConfig.js";
import { getSiteHashKey, getSiteIDsKey } from "./redis_key_generator.js";

const flatten = (list) => {
  const flattenedList = list.toObject();
  for (const key in flattenedList) {
    console.log(key, flattenedList[key]);
    flattenedList[key] = flattenedList[key].toString();
  }
  //   flattenedList._id = flattenedList._id.toString();
  return flattenedList;
};
const updateList = async (id) => {
  await client.del(`lists:${id}`);
};
const getAllLists = async (id) => {
  const result = await client.get(`lists:${id}`);
  return JSON.parse(result);
};
const setAllLists = async (id, list) => {
  const result = await client.set(`lists:${id}`, JSON.stringify(list));
  return result;
};

const setTasks = async (id, tasks) => {
  const result = await client.set(`tasks:${id}`, JSON.stringify(tasks));
  return result;
};
const getTasks = async (id) => {
  const result = await client.get(`tasks:${id}`);
  return JSON.parse(result);
};
const updateTask = async (id) => {
  await client.del(`tasks:${id}`);
};
export { updateList, getAllLists, setAllLists, setTasks, getTasks, updateTask };
