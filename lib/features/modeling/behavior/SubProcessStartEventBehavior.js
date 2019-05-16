import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';
import { isExpanded } from '../../../util/DiUtil.js';

export default function SubProcessStartEventBehavior(eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  var isReplacing = false,
      isPasting = false,
      preReplacedShape = null;

  this.preExecute('shape.replace', function(event) {
    isReplacing = true;
    preReplacedShape = event.context.oldShape;
  });

  this.postExecuted('shape.replace', function(event) {
    isReplacing = false;
    preReplacedShape = null;
  });

  this.preExecute('elements.paste', function(event) {
    isPasting = true;
  });

  this.postExecuted('elements.paste', function(event) {
    isPasting = false;
  });

  /**
   * Add start event child when creating expanded sub process
   */
  this.postExecuted('shape.create', function(event) {
    var shape = event.context.shape,
        position;

    if (
      !is(shape, 'bpmn:SubProcess') ||
      is(shape, 'bpmn:Transaction') ||
      is(shape, 'bpmn:AdHocSubProcess') ||
      !isExpanded(shape)
    ) {
      return;
    }

    if (
      isReplacing &&
      preReplacedShape &&
      (is(preReplacedShape, 'bpmn:SubProcess') || preReplacedShape.children.length)
    ) {
      return;
    }

    if (isPasting) {
      return;
    }

    position = {
      x: shape.x + shape.width / 6,
      y: shape.y + shape.height / 2
    };

    modeling.createShape({ type: 'bpmn:StartEvent' }, position, shape);
  });
}

SubProcessStartEventBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(SubProcessStartEventBehavior, CommandInterceptor);
