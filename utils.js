const shuffle = (arr) => {
  let counter = arr.length;
  while (counter--) {
    const index = Math.floor(Math.random() * counter);
    [arr[counter], arr[index]] = [arr[index], arr[counter]];
  }
};
