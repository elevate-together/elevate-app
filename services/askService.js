import axios from "axios";

export async function sendQuestion(question) {
  try {
    const response = await axios.post("http://127.0.0.1:5000/ask", {
      question, 
    });

    console.log("Response from server:", response.data);
    return response.data; 
  } catch (error) {
    console.error("Error sending question to server:", error);
    return null;
  }
}
