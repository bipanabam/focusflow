export const Card = ({ children, className }) => {
  return (
    <div className={`bg-gray-800 shadow-md rounded-lg p-4 ${className}`}>
        {children}
        </div>
    )
    }       