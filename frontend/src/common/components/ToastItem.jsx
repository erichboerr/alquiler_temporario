import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimes 
} from "react-icons/fa";

const iconMap = {
  success: <FaCheckCircle className="text-green-500" />,
  error: <FaExclamationCircle className="text-red-500" />,
  warning: <FaExclamationTriangle className="text-yellow-500" />,
  info: <FaInfoCircle className="text-blue-500" />,
};

const bgMap = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  warning: "border-l-yellow-500",
  info: "border-l-blue-500",
};

export default function ToastItem({ t, removeToast }) {
  return (
    <div
      className={`flex items-center w-80 p-4 mb-4 bg-white border-l-4 rounded-lg shadow-xl animate-slide-in ${bgMap[t.type]}`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-xl">
        {iconMap[t.type]}
      </div>
      <div className="ml-3 text-sm font-normal text-gray-700 flex-1">
        {t.message}
      </div>
      <button
        onClick={() => removeToast(t.id)}
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8 transition"
      >
        <FaTimes />
      </button>
    </div>
  );
}