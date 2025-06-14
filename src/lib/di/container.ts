import { container } from "tsyringe";
import { TYPES } from "./types";
import StaticSegmentationProvider from "../segmentation/static/StaticSegmentationProvider";
import GroundService from "../validation/GroundService";
import SizeService from "../validation/SizeService";
import ValidationRuleResolver from "../validation/ValidationRuleResolver";
import ErrorMessageService from "../validation/ErrorMessageService";
import TransformationValidator from "../validation/validators/TransformationValidator";
import createValidators from "../validation/validators";
import Validation from "../validation/Validation";

export function configureContainer() {
  container.register(TYPES.SegmentationService, {
    useClass: StaticSegmentationProvider,
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

  // Register validators
  container.register(TYPES.Validators, {
    useFactory: () => createValidators(),
  });

  // Register main validation class
  container.register(TYPES.Validation, {
    useClass: Validation,
  });
}
