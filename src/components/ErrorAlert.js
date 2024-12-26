import { Alert, Snackbar } from '@mui/material';

const ErrorAlert = ({ error, onClose }) => {
    return (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={onClose}>
            <Alert onClose={onClose} severity="error">
                {error}
            </Alert>
        </Snackbar>
    );
};

export default ErrorAlert; 