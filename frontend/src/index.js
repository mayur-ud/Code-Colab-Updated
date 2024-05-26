import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { StoreProvider } from "./assets/StoreContext"

const client = new ApolloClient({
  uri: "http://localhost:4000", 
  cache: new InMemoryCache(),
});

console.log("ENV: " , process.env.REACT_APP_BACKEND_WS_URI , process.env.REACT_APP_BACKEND_GQL_URI)
console.log("DOCKER: " , )

ReactDOM.render(
  <ApolloProvider client={client}>
    <StoreProvider>
      <App />
    </StoreProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
