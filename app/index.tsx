import { Redirect } from "expo-router";

const isAuthenticated = false;

export default function Index() {
  return <Redirect href={isAuthenticated ? "/training" : "/auth/signIn"} />;
}
