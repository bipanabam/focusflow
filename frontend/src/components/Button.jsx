export const Button = ({ children, onClick, className }) => {
  return (
    <button onClick={onClick} className={`rounded-md p-1 px-2 ${className}`} type='button'>
      {children}
    </button>
  )
}