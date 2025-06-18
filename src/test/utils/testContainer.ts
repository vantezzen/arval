import { container } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import {
  MockSegmentationProvider,
  MockSizeService,
  MockGroundService,
  MockValidationRuleResolver,
} from "../mocks/mockServices";

export class TestContainer {
  registerMockSegmentationProvider() {
    container.register(TYPES.SegmentationService, {
      useClass: MockSegmentationProvider,
    });
    return container.resolve<MockSegmentationProvider>(
      TYPES.SegmentationService
    );
  }

  registerMockSizeService() {
    container.register(TYPES.SizeService, {
      useClass: MockSizeService,
    });
    return container.resolve<MockSizeService>(TYPES.SizeService);
  }

  registerMockGroundService() {
    container.register(TYPES.GroundService, {
      useClass: MockGroundService,
    });
    return container.resolve<MockGroundService>(TYPES.GroundService);
  }

  registerMockValidationRuleResolver() {
    container.register(TYPES.ValidationRuleResolver, {
      useClass: MockValidationRuleResolver,
    });
    return container.resolve<MockValidationRuleResolver>(
      TYPES.ValidationRuleResolver
    );
  }
}

export const createTestContainer = () => new TestContainer();
