export default checkCurrency = async (currencyCode, amount) => {
  try {
    const response = await fetch("https://www.floatrates.com/daily/usd.json");
    const data = await response.json();

    let currentAmount = 0;

    if (currencyCode.toLowerCase() === "usd") {
      currentAmount = amount;
    } else if (data[currencyCode.toLowerCase()]) {
      const currencyRate = data[currencyCode.toLowerCase()].rate;
      const exchangeRate = 1 / currencyRate;
      const usdEquivalent = amount / exchangeRate;
      currentAmount = usdEquivalent;

      //   console.log(`The equivalent amount in ${currencyCode} is: ${usdEquivalent.toFixed(2)}`);
    } else {
      //    console.log(`Exchange rate for ${currencyCode} not available.`);
    }

    return currentAmount;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    Alert.alert("Failed to fetch exchange rates.");
    return 0;
  }
};
