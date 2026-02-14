import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();

  const providers = [
    {
      name: "Google",
      url: "https://api.optionsstrategies.in/auth/google",
      bg: "bg-white border",
      text: "text-black",
    },
    {
      name: "Apple",
      url: "https://api.optionsstrategies.in/auth/apple",
      bg: "bg-black",
      text: "text-white",
    },
    {
      name: "Microsoft",
      url: "https://api.optionsstrategies.in/auth/microsoft",
      bg: "bg-blue-600",
      text: "text-white",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Sign in to Options Strategies
        </h2>

        {providers.map((provider) => (
          <button
            key={provider.name}
            className={`w-full py-3 rounded-lg mb-4 font-medium ${provider.bg} ${provider.text}`}
            onClick={() => (window.location.href = provider.url)}
          >
            Continue with {provider.name}
          </button>
        ))}

        <div className="text-center mt-4 text-sm text-gray-500">
          OR
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 py-2 text-blue-600 border rounded-lg"
        >
          Sign in with Email
        </button>
      </div>
    </div>
  );
}
