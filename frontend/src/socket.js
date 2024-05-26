import { io } from "socket.io-client";

export const initSocket = async () => {
  console.log("INIT SOCKET CALLEDDD\n\n\n\n")
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  try {
    return io('http://localhost:8080', options); 
    
  } catch (error) {
    console.log(error , "IN WS CONNECTIOn")
  } 
};
 
