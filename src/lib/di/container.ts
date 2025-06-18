import { container } from "tsyringe";
import { TYPES } from "./types";
import GeoJsonSegmentationProvider from "../segmentation/geojson/GeoJsonSegmentationProvider";
import GroundService from "../validation/GroundService";
import SizeService from "../validation/SizeService";
import ValidationRuleResolver from "../validation/ValidationRuleResolver";
import ErrorMessageService from "../validation/ErrorMessageService";
import TransformationValidator from "../validation/validators/TransformationValidator";
import createValidators from "../validation/validators";
import ValidationOrchestrator from "../validation/ValidationOrchestrator";
import ValidationExecutor from "../validation/ValidationExecutor";
import ValidationReporter from "../validation/ValidationReporter";
import InteractionService from "../interaction/InteractionService";

export function configureContainer() {
  container.register(TYPES.SegmentationService, {
    useClass: GeoJsonSegmentationProvider,
  });

  container.register(TYPES.GroundService, {
    useClass: GroundService,
  });

  container.register(TYPES.InteractionService, {
    useClass: InteractionService,
  });

  container.register(TYPES.SizeService, {
    useClass: SizeService,
  });

  container.register(TYPES.ValidationRuleResolver, {
    useClass: ValidationRuleResolver,
  });

  container.register(TYPES.ErrorMessageService, {
    useClass: ErrorMessageService,
  });

  container.register(TYPES.TransformationValidator, {
    useClass: TransformationValidator,
  });

  container.register(TYPES.ValidationExecutor, {
    useClass: ValidationExecutor,
  });

  container.register(TYPES.ValidationReporter, {
    useClass: ValidationReporter,
  });

  container.register(TYPES.ValidationOrchestrator, {
    useClass: ValidationOrchestrator,
  });

  // Register validators
  container.register(TYPES.Validators, {
    useFactory: () => createValidators(),
  });
}

export function configureTestContainer() {
  container.register(TYPES.SegmentationService, {
    useClass: GeoJsonSegmentationProvider,
  });

  container.register(TYPES.GroundService, {
    useClass: GroundService,
  });

  container.register(TYPES.SizeService, {
    useClass: SizeService,
  });

  container.register(TYPES.ValidationRuleResolver, {
    useClass: ValidationRuleResolver,
  });

  container.register(TYPES.ErrorMessageService, {
    useClass: ErrorMessageService,
  });

  container.register(TYPES.TransformationValidator, {
    useClass: TransformationValidator,
  });

  container.register(TYPES.ValidationExecutor, {
    useClass: ValidationExecutor,
  });

  container.register(TYPES.ValidationReporter, {
    useClass: ValidationReporter,
  });

  container.register(TYPES.ValidationOrchestrator, {
    useClass: ValidationOrchestrator,
  });

  // Register validators
  container.register(TYPES.Validators, {
    useFactory: () => createValidators(),
  });
}
