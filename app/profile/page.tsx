import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Devices } from "./Devices";
import { Card } from "@components/ui/card";

const UsersPage = () => {
  return (
    <div className="flex justify-center items-center m-5">
      <Tabs defaultValue="account" className=" md: w-[500px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notification">
            Manage Push Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="notification">
          <Card>
            <Devices />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
