const log = (...args) => {
    if (import.meta.env.VITE_APP_ENV !== "production") {
      console.log(...args);
    }
  };

  export default log;
  