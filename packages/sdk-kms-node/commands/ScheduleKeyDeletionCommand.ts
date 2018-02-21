import * as __aws_middleware_stack from '@aws/middleware-stack';
import * as __aws_types from '@aws/types';
import * as _stream from 'stream';
import {ScheduleKeyDeletion} from '../model/ScheduleKeyDeletion';
import {InputTypesUnion} from '../types/InputTypesUnion';
import {OutputTypesUnion} from '../types/OutputTypesUnion';
import {ScheduleKeyDeletionInput} from '../types/ScheduleKeyDeletionInput';
import {ScheduleKeyDeletionOutput} from '../types/ScheduleKeyDeletionOutput';
import {KMSResolvedConfiguration} from '../KMSConfiguration';

export class ScheduleKeyDeletionCommand implements __aws_types.Command<
    InputTypesUnion,
    ScheduleKeyDeletionInput,
    OutputTypesUnion,
    ScheduleKeyDeletionOutput,
    KMSResolvedConfiguration,
    _stream.Readable
> {
    readonly middlewareStack = new __aws_middleware_stack.MiddlewareStack<
        ScheduleKeyDeletionInput,
        ScheduleKeyDeletionOutput,
        _stream.Readable
    >();

    constructor(readonly input: ScheduleKeyDeletionInput) {}

    resolveMiddleware(
        clientStack: __aws_middleware_stack.MiddlewareStack<InputTypesUnion, OutputTypesUnion, _stream.Readable>,
        configuration: KMSResolvedConfiguration
    ): __aws_types.Handler<ScheduleKeyDeletionInput, ScheduleKeyDeletionOutput> {
        const {handler} = configuration;
        const stack = clientStack.concat(this.middlewareStack);

        const handlerExecutionContext: __aws_types.HandlerExecutionContext = {
            logger: {} as any,
            model: ScheduleKeyDeletion
        };

        return stack.resolve(
            handler<ScheduleKeyDeletionInput, ScheduleKeyDeletionOutput>(handlerExecutionContext),
            handlerExecutionContext
        );
    }
}