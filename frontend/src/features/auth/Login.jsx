import { login } from "../../api/auth.api";

export default function Login() {
  const handleLogin = async () => {
    const res = await login({
      email: "prabhu@test.com",
      password: "123456",
    });
    localStorage.setItem("token", res.data.token);
    alert("Login success");
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}