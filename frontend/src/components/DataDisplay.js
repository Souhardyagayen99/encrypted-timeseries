import React, { useState, useEffect } from "react";

const DataDisplay = () => {
  const [data, setData] = useState([]);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:3001"); // WebSocket connection to your listener service

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Check data integrity here
      if (checkDataIntegrity(message)) {
        setData((prevData) => [...prevData, message]);
      }

      // Calculate success rate
      const totalMessages = data.length + 1;
      const successfulMessages = data.length + 1;
      setSuccessRate((successfulMessages / totalMessages) * 100);
    };

    return () => {
      socket.close();
    };
  }, [data]);

  const checkDataIntegrity = (message) => {
    // Implement your data integrity check here
    // For example, verify the secret_key
    const calculatedSecretKey = crypto
      .createHash("sha256")
      .update(JSON.stringify(message))
      .digest("hex");
    return calculatedSecretKey === message.secret_key;
  };

  return (
    <div>
      <h2>Data Display</h2>
      <div>
        <h3>Success Rate: {successRate.toFixed(2)}%</h3>
      </div>
      <ul>
        {data.map((message, index) => (
          <li key={index}>
            <p>Name: {message.name}</p>
            <p>Origin: {message.origin}</p>
            <p>Destination: {message.destination}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataDisplay;
