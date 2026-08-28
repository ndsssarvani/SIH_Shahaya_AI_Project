import React from "react";
import { useNavigate } from "react-router-dom";

const ClientNavbar = () => {
const navigate = useNavigate();

return ( <nav> <h2>AI Stress & Trauma Support System</h2>


  <div>
    <button onClick={() => navigate("/complaint")}>
      Complaint
    </button>

    <button onClick={() => navigate("/assessment")}>
      Assessment
    </button>

    <button onClick={() => navigate("/support")}>
      Support
    </button>

    <button onClick={() => navigate("/status")}>
      Status
    </button>

    <button onClick={() => navigate("/")}>
      Logout
    </button>
  </div>
</nav>


);
};

export default ClientNavbar;