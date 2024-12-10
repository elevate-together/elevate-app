import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Devices } from "./Devices";
import { Info } from "./Info";

const UsersPage = () => {
  return (
    <div className="flex justify-center items-center m-5 ">
      <Tabs defaultValue="account" className=" md: max-w-md">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notification">
            Manage Push Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Info />
        </TabsContent>
        <TabsContent value="notification">
          <Devices />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
