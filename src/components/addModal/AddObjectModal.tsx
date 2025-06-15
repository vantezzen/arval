import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import OBJECTS from "@/lib/config/objects";
import ObjectDemo from "./ObjectDemo";
import { useObjectStore } from "@/lib/stores/objectStore";
import ObjectDto from "@/lib/dto/Object";
import { Euler, Vector3 } from "three";
import { useState } from "react";

function AddObjectModal() {
  const objectStore = useObjectStore();
  // const { camera } = useThree();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
          <Plus size={24} />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Objekt hinzufügen</DrawerTitle>
        </DrawerHeader>

        <div className="grid grid-cols-3 gap-3 mb-12">
          {Object.values(OBJECTS).map((object, index) => (
            <button
              key={index}
              className="cursor-pointer w-full h-32"
              onClick={() => {
                const direction = new Vector3(0, 0, -1);
                // direction.applyQuaternion(camera.quaternion);
                // const position = camera.position
                //   .clone()
                //   .add(direction.multiplyScalar(5));

                const newObject = new ObjectDto(
                  object.id,
                  new Vector3(0, 0, 0),
                  new Euler(),
                  new Vector3(1, 1, 1)
                );
                objectStore.addObject(newObject);
                objectStore.setEditingObject(newObject);
                setIsOpen(false);
              }}
            >
              <ObjectDemo url={object.model} />
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default AddObjectModal;
