import logging
import os


def setup_logger(
    name: str,
    level: int = logging.DEBUG,
    log_format: str = '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    console_output: bool = True,
    file_output: bool = False,
    log_file: str = "app.log",
):
    """
    Sets up a custom logger with optional console and file output.

    Args:
        name (str): The name of the logger.
        log_file (str): The name of the log file.
        level (int): The logging level (e.g., logging.INFO, logging.DEBUG).
        console_output (bool): Whether to output logs to the console.
        file_output (bool): Whether to output logs to a file.
        log_format (str): The format string for log messages.

    Returns:
        logging.Logger: The configured logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Prevent adding multiple handlers if the logger is already set up
    if not logger.handlers:
        formatter = logging.Formatter(log_format)

        if console_output:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)

        if file_output:
            # Ensure the log directory exists
            log_dir = os.path.dirname(log_file)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir)

            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

    return logger
