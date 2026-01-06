from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.tasks import TaskUpdater
from a2a.types import (
    TaskState,
    UnsupportedOperationError,
)
from a2a.utils import (
    new_agent_text_message,
    new_task,
)
from a2a.utils.errors import ServerError
from a2a_agent.agent import MermaidAgent
from uuid import uuid4
from a2a_agent.utils.logger import setup_logger

_logger = setup_logger(__name__)


class MermaidAgentExecutor(AgentExecutor):
    """Mermaid Diagram AgentExecutor."""

    def __init__(self):
        self._agent = MermaidAgent()

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        try:
            _logger.info(
                f"Incoming Message:\n{context.message.model_dump_json(indent=4)}")
            task = context.current_task
            if not task:
                if context.message.context_id is None:
                    context.message.context_id = context.message.model_dump()[
                        "contextId"]
                task = new_task(context.message)
                await event_queue.enqueue_event(task)
            updater = TaskUpdater(event_queue, task.id, task.context_id)

            _logger.info("Starting streaming execution...")

            full_response = ""
            chunk_count = 0
            async for chunk in self._agent.astream(
                context.message,
                {
                    'configurable': {
                        'thread_id': task.context_id  # Use task context ID
                    }
                }
            ):
                chunk_count += 1
                _logger.info(
                    f"Executor received chunk {chunk_count}: {chunk[:50]}...")
                full_response += chunk
                # Send chunk as a message event
                await event_queue.enqueue_event(
                    new_agent_text_message(
                        chunk,
                        task.context_id,
                        task.id
                    )
                )

            _logger.info(f"Streaming complete. Total chunks: {chunk_count}")

            await updater.update_status(
                TaskState.completed,
                new_agent_text_message(
                    full_response,
                    task.context_id,
                    task.id,
                )
            )
        except Exception as e:
            _logger.error(
                f"Fatal error in agent execution: {str(e)}", exc_info=True)
            if 'updater' in locals():
                await updater.update_status(
                    TaskState.failed,  # Or completed with error if failed is not preferred
                    new_agent_text_message(
                        f"An error occurred: {str(e)}",
                        task.context_id if 'task' in locals() and task else "unknown",
                        task.id if 'task' in locals() and task else "unknown",
                    )
                )
            elif 'event_queue' in locals():
                await event_queue.enqueue_event(
                    new_agent_text_message(
                        f"Fatal error: {str(e)}",
                        "error",
                        "error"
                    )
                )

    async def cancel(
        self, context: RequestContext, event_queue: EventQueue
    ) -> None:
        raise ServerError(error=UnsupportedOperationError())
