/* Randomize array in-place using Durstenfeld shuffle algorithm */
/* Using ES6 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
// Function to check if a datetime and today's date are equal
function isEqualDateTime(date1) {
  // Get the values of year, month and day from both dates
  date1 = new Date(date1);
  const date2 = new Date();

  const d1 = date1.toLocaleDateString();

  const d2 = date2.toLocaleDateString();

  // Get the values of hours, minutes and seconds from both dates
  const h1 = date1.getHours();

  const h2 = date2.getHours() - 1;

  console.log(`date1-${d1} ${h1}`, `date2-${d2} ${h2}`);

  // Check if all the values are equal or not
  return d1 == d2 && h1 == h2;
}

const isEligible = (from, to) => {
  const today = new Date().toLocaleDateString();
  let arr = [];
  let dt = new Date(to);
  from = new Date(from);
  while (dt <= from) {
    arr.push(new Date(dt).toLocaleDateString());
    dt.setDate(dt.getDate() + 1);
  }
  return arr.includes(today);
};

const simpleAsync = (fn) => (...args) => Promise.resolve(fn(...args)).catch(err => new Error(err.message));

module.exports = {
  shuffleArray,
  isEqualDateTime,
  isEligible,
  simpleAsync,
};
