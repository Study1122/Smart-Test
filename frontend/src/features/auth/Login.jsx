import { login } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  
  const handleLogin = async () => {
    const res = await login({
      email: "prabhu@test.com",
      password: "123456",
    });
    localStorage.setItem("token", res.data.token);
    alert("Login success");
    navigate("/admin/exams"); // 🔥 redirect
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}