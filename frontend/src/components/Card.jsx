export const Card = ({ title, children, className }) => {
  return (
    <div className={`w-full max-w-sm bg-gray-700 shadow-lg rounded-xl p-6 ${className}`}>
        <h2 className="text-2xl font-semibold text-center mb-4">
          {title}
        </h2>
        {children}
    </div>
    )
}       