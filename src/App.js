import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/organizations.component";
import Profile from "./components/profile.component";
import BoardUser from "./components/board-user.component";
import BoardAdmin from "./components/board-admin.component";
import NavDropdown from 'react-bootstrap/NavDropdown';

// import AuthVerify from "./common/auth-verify";
import EventBus from "./common/EventBus";
import { Container, Nav, Navbar } from 'react-bootstrap';
import ServicesPage from './components/services.component';
import SpecialistsComponent from './components/specialists.component';
import SpecialistServiceComponent from './components/specialist-service.component';
import BookingsPage from './components/booking.component';

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };
  }

  async componentDidMount() {
    const user = await AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        showUserBoard: user.role === 'USER',
        showAdminBoard: user.role === 'ADMIN',
      });
    }

    EventBus.on("logout", () => {
      this.logOut();
    });
  }

  componentWillUnmount() {
    EventBus.remove("logout");
  }

  logOut() {
    AuthService.logout();
    this.setState({
      showUserBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    });
  }

  render() {
    const { currentUser, showUserBoard, showAdminBoard } = this.state;

    return (
      <div>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">JOURNAL</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/organizations">Organizations</Nav.Link>
                <Nav.Link as={Link} to="/bookings">Bookings</Nav.Link>
              </Nav>
              <Nav>
                {showUserBoard ? (
                    <>
                      <NavDropdown title={currentUser.fio} id="user-nav-dropdown" align="end">
                        <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
                      </NavDropdown>
                    </>
                ) : (
                    <>
                      <Nav.Link as={Link} to="/login">Login</Nav.Link>
                      <Nav.Link as={Link} to="/register">Register</Nav.Link>
                    </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/organizations" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/specialists" element={<SpecialistsComponent />} />
            <Route path="/specialist/services" element={<SpecialistServiceComponent />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/admin" element={<BoardAdmin />} />
          </Routes>
        </div>

        {/* <AuthVerify logOut={this.logOut}/> */}
      </div>
    );
  }
}

export default App;
