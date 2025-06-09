import React, { Component } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { withRouter } from '../utils/withRouter'; // если используешь HOC
import RegistrationService from '../services/registration.service';

class AppointmentsPage extends Component {
  state = {
    appointments: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
    orgId: null,
  };

  componentDidMount() {
    const searchParams = new URLSearchParams(this.props.location.search);
    const orgId = searchParams.get('organization_id');

    if (!orgId) {
      this.setState({ error: 'organization_id не указан в URL' });
      return;
    }

    this.setState({ orgId }, () => {
      this.loadAppointments();
      window.addEventListener('scroll', this.handleScroll);
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    const { loading, hasMore } = this.state;
    if (loading || !hasMore) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const visibleHeight = window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollY + visibleHeight + 100 >= pageHeight) {
      this.loadAppointments();
    }
  };

  loadAppointments = async () => {
    const { page, appointments, orgId } = this.state;

    this.setState({ loading: true });

    try {
      const res = await RegistrationService.getOrgBookings(page, 10, orgId); // метод тот же
      const newItems = res.data.items;

      this.setState({
        appointments: [...appointments, ...newItems],
        page: page + 1,
        hasMore: newItems.length === 10,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      this.setState({ error: 'Не удалось загрузить записи', loading: false });
    }
  };

  render() {
    const { appointments, loading, error } = this.state;

    return (
      <div className="container py-4">
      <h2 className="mb-4">Записи в моей организации</h2>

    {error && <Alert variant="danger">{error}</Alert>}

      {appointments.length === 0 && !loading ? (
        <Alert variant="info">Записей пока нет</Alert>
      ) : (
        <div className="row g-4">
          {appointments.map((appt) => (
              <div className="col-md-6" key={appt._id}>
            <Card>
              <Card.Body>
                <Card.Title>Услуга: {appt.service.title}</Card.Title>

            <Card.Subtitle className="mb-2 text-muted">
            Специалист: {appt.specialist.fio}
        </Card.Subtitle>

        <Card.Text>
        <strong>Дата:</strong>{' '}
        {new Date(appt.time).toLocaleString()}
        </Card.Text>

        <Card.Text>
        <strong>Имя клиента:</strong> {appt.user?.fio || 'Неизвестно'}
      </Card.Text>
        <Card.Text>
        <strong>Почта клиента:</strong> {appt.user?.email || 'Неизвестно'}
      </Card.Text>

      <Card.Text>
      <strong>Заметка:</strong> {appt.note || '—'}
      </Card.Text>

      <Card.Text>
      <strong>Длительность:</strong> {appt.duration} мин
      </Card.Text>

      <Card.Text>
      <strong>Цена:</strong> {appt.service.price} сом
      </Card.Text>
      </Card.Body>
      </Card>
      </div>
      ))}
        </div>
      )}

      {loading && (
        <div className="text-center my-4">
        <Spinner animation="border" variant="primary" />
        </div>
      )}
      </div>
    );
    }
  }

  export default withRouter(AppointmentsPage);
