import Head from "next/head";
import Box from "@mui/material/Box";
import HomePageTemplate from "../components/templates/Homepage/HomepageTemplate";

export default function Home() {
  return (
    <Box>
      <Head>
        <title>Datatopia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomePageTemplate />
    </Box>
  );
}
