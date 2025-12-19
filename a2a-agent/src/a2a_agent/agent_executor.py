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


class MermaidAgentExecutor(AgentExecutor):
    """Mermaid Diagram AgentExecutor."""

    def __init__(self):
        self._agent = MermaidAgent()

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        task = context.current_task
        if not task:
            task = new_task(context.message)
            await event_queue.enqueue_event(task)
        updater = TaskUpdater(event_queue, task.id, task.context_id)
        result = await self._agent.ainvoke(
            context.message,
            {
                'configurable': {
                    'thread_id': f"{str(uuid4())}"
                }
            }
        )
        await updater.update_status(
            TaskState.completed if result.status == "completed" else TaskState.failed,
            new_agent_text_message(
                result.message,
                task.context_id,
                task.id,
            )
        )

    async def cancel(
        self, context: RequestContext, event_queue: EventQueue
    ) -> None:
        raise ServerError(error=UnsupportedOperationError())
