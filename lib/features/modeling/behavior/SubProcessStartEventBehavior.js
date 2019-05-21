import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';
import { isExpanded } from '../../../util/DiUtil.js';

export default function SubProcessStartEventBehavior(eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  // Add start event child when creating expanded sub process from palette
  this.postExecuted('shape.create', function(event) {
    var shape = event.context.shape,
        hints = event.context.hints,
        position;

    if (
      !is(shape, 'bpmn:SubProcess') ||
      !isExpanded(shape) ||
      hints.createdFrom !== 'palette'
    ) {
      return;
    }

    position = calculatePositionRelativeToShape(shape);

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, shape);
  });

  // Add start event child when replacing task with expanded subprocess
  this.postExecuted('shape.replace', function(event) {
    var oldShape = event.context.oldShape,
        newShape = event.context.newShape,
        position;

    if (
      !is(newShape, 'bpmn:SubProcess') ||
      !isExpanded(newShape) ||
      !is(oldShape, 'bpmn:Task')
    ) {
      return;
    }

    position = calculatePositionRelativeToShape(newShape);

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, newShape);
  });
}

SubProcessStartEventBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(SubProcessStartEventBehavior, CommandInterceptor);

// helpers //////////

function calculatePositionRelativeToShape(shape) {
  return {
    x: shape.x + shape.width / 6,
    y: shape.y + shape.height / 2
  };
}
