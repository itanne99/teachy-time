import { NavBar } from "@/components/NavBar/NavBar";
import "bootswatch/dist/litera/bootstrap.min.css";
import { Container } from "react-bootstrap";

export default function App({ Component, pageProps }) {
  return(
  <Container fluid className="p-0 bg-light d-flex flex-column" style={{ minHeight: "100vh" }}>
    <NavBar/>
    <Component {...pageProps} />
  </Container>);
}
