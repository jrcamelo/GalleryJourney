function listToHash(list: string[]): { [key: string]: boolean } {
  return list.reduce((acc: { [key: string]: boolean }, val: string) => {
    acc[val] = true;
    return acc;
  }, {});
}


export {
  listToHash,
}