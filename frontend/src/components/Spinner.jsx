const Spinner = ({fullScreen = false}) => {
    if (fullScreen) {
         return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    }

    return (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    );
};

export default Spinner;