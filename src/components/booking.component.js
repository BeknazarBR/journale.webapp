import React, { Component } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import RegistrationService from '../services/registration.service';

class BookingsPage extends Component {
    state = {
        bookings: [],
        loading: false,
        error: null,
        page: 1,
        hasMore: true,
    };

    componentDidMount() {
        this.loadBookings();
        window.addEventListener('scroll', this.handleScroll);
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
            this.loadBookings();
        }
    };

    loadBookings = async () => {
        const { page, bookings } = this.state;

        this.setState({ loading: true });

        try {
            const res = await RegistrationService.getUserBookings(page, 10);
            const newItems = res.data.items;
            console.log(newItems);
            this.setState({
                bookings: [...bookings, ...newItems],
                loading: false,
                page: page + 1,
                hasMore: newItems.length === 10,
            });
        } catch (err) {
            console.error(err);
            this.setState({ error: 'Не удалось загрузить записи', loading: false });
        }
    };

    render() {
        const { bookings, loading, error } = this.state;

        return (
            <div clabookingName="container py-4">
                <h2 clabookingName="mb-4">Мои записи</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                {bookings.length === 0 && !loading ? (
                    <Alert variant="info">У вас пока нет записей</Alert>
                ) : (
                    <div clabookingName="row g-4">
                        {bookings.map((booking) => {
                            return (
                                <div clabookingName="col-md-6" key={booking._id}>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>{booking.service.title}</Card.Title>
                                            <Card.Subtitle clabookingName="mb-2 text-muted">
                                                Специалист: {booking.specialist.fio}
                                            </Card.Subtitle>
                                            <Card.Text>
                                                <strong>Дата:</strong>{' '}
                                                {new Date(booking.time).toLocaleString()}
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Заметка:</strong> {booking.note || '—'}
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Длительность:</strong> {booking.duration} мин
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Цена:</strong> {booking.service.price} сом
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                )}

                {loading && (
                    <div clabookingName="text-center my-4">
                        <Spinner animation="border" variant="primary" />
                    </div>
                )}
            </div>
        );
    }
}

export default BookingsPage;
