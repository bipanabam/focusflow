const AuthCard = ({ title, children, footer }) => {
    return (
        <div className="w-full max-w-sm bg-gray-700 shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-center mb-4">
                {title}
            </h2>

            {children}

            {footer && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default AuthCard;
