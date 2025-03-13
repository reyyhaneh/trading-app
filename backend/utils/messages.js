const messages = {
    AUTH: {
      MISSING_TOKEN: "No token provided. Authorization denied.",
      INVALID_TOKEN: "Token is not valid.",
      USER_NOT_FOUND: "User not found.",
      USER_EXISTS: "This user already exists, please log in.",
      EMAIL_VERIFIED: "Email verified successfully, please log in."
    },
  
    TRADE: {
      MISSING_FIELDS: "Missing required fields for trade.",
      INSUFFICIENT_FUNDS: "Insufficient funds for this trade.",
      INSUFFICIENT_ASSETS: "Not enough assets to sell.",
      INVALID_TRADE_TYPE: "Trade type must be 'buy' or 'sell'.",
      TRADE_FAILED: "Failed to execute trade. Please try again.",
    },
  
    BALANCE: {
      FETCH_ERROR: "Error fetching user balance.",
      UPDATE_ERROR: "Error updating user balance.",
    },
  
    PORTFOLIO: {
      NOT_FOUND: "No portfolio found for this stock.",
      UPDATE_ERROR: "Error updating portfolio.",
    },
  
    TASKS: {
      FETCH_ERROR: "Error fetching user tasks.",
      UPDATE_ERROR: "Error updating task progress.",
    },
  
    GENERAL: {
      SERVER_ERROR: "An unexpected error occurred. Please try again later.",
      DATABASE_ERROR: "Database operation failed.",
    }
  };
  
  module.exports = messages;
  