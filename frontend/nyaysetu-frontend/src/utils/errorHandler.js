export const getErrorMessage = (error) => {
    if (!error.response) {
        return "Network error. Please check your internet connection.";
    }

    switch (error.response.status) {
        case 400:
            return error.response.data?.message || "Bad request.";
        case 401:
            return "Session expired. Please login again.";
        case 403:
            return "You are not authorized to perform this action.";
        case 404:
            return "Requested resource not found.";
        case 500:
            return "Internal server error. Please try again later.";
        default:
            return error.response.data?.message || "Something went wrong.";
    }
};