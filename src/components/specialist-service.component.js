import React, { Component, createRef } from 'react';
import {
    Spinner, Card, Alert, Button, Modal, Form,
} from 'react-bootstrap';
import { withRouter } from '../utils/withRouter';
import SpecialistServiceService from '../services/services.service';
import BookService from '../services/registration.service';

const ITEMS_PER_PAGE = 10;

class SpecialistServicesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            services: [],
            error: null,
            hasMore: true,
            page: 1,
            specialistId: null,
            showModal: false,
            selectedService: null,
            note: '',
            time: '',
            bookingLoading: false,
            bookingSuccess: null,
        };
        this.observer = null;
        this.lastCardRef = createRef();
    }

    async componentDidMount() {
        const searchParams = new URLSearchParams(this.props.location.search);
        const specialistId = searchParams.get('specialist_id');

        if (!specialistId) {
            this.setState({ error: 'Отсутствует specialist_id в URL' });
            return;
        }

        this.setState({ specialistId }, () => {
            this.loadMore();
            this.initIntersectionObserver();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            this.lastCardRef.current &&
            this.state.services.length !== prevState.services.length
        ) {
            this.initIntersectionObserver();
        }
    }

    initIntersectionObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting && this.state.hasMore && !this.state.loading) {
                await this.loadMore();
            }
        });

        if (this.lastCardRef.current) {
            this.observer.observe(this.lastCardRef.current);
        }
    }

    loadMore = async () => {
        const { specialistId, page, services } = this.state;

        this.setState({ loading: true });

        try {
            const res = await SpecialistServiceService.getServicesBySpecialist(
                page,
                ITEMS_PER_PAGE,
                specialistId
            );
            const newServices = res.data.items;

            this.setState({
                services: [...services, ...newServices],
                page: page + 1,
                hasMore: newServices.length === ITEMS_PER_PAGE,
                loading: false,
            });
        } catch (err) {
            console.error(err);
            this.setState({ error: 'Не удалось загрузить услуги специалиста', loading: false });
        }
    };

    openModal = (ss) => {
        this.setState({ showModal: true, selectedService: ss, note: '', time: '', bookingSuccess: null });
    };

    closeModal = () => {
        this.setState({ showModal: false, selectedService: null });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const { selectedService, note, time } = this.state;

        if (!time) {
            alert('Пожалуйста, укажите время');
            return;
        }

        this.setState({ bookingLoading: true });

        try {
            await BookService.bookService({
                specialist_service_id: selectedService._id,
                note,
                time,
            });

            this.setState({
                bookingSuccess: 'Вы успешно записались!',
                bookingLoading: false,
                note: '',
                time: '',
            });

            // Закрытие через 2 сек (можно убрать)
            setTimeout(() => {
                this.closeModal();
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Не удалось записаться');
            this.setState({ bookingLoading: false });
        }
    };

    render() {
        const {
            services, loading, error, hasMore,
            showModal, selectedService, note, time,
            bookingLoading, bookingSuccess,
        } = this.state;

        if (error) {
            return (
                <div className="container mt-4">
                    <Alert variant="danger">{error}</Alert>
                </div>
            );
        }

        return (
            <div className="container py-4">
                <h2 className="mb-4">Услуги специалиста</h2>

                {services.length === 0 && !loading ? (
                    <Alert variant="info">Услуг у специалиста пока нет</Alert>
                ) : (
                    <div className="row g-4">
                        {services.map((ss, index) => (
                            <div
                                className="col-md-4"
                                key={ss._id}
                                ref={index === services.length - 1 ? this.lastCardRef : null}
                            >
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{ss.service.title}</Card.Title>
                                        <Card.Text>{ss.service.description}</Card.Text>
                                        <Card.Text>
                                            <strong>Цена:</strong> {ss.service.price} сом
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Длительность:</strong> {ss.duration} минут
                                        </Card.Text>
                                        <Button variant="primary" onClick={() => this.openModal(ss)}>
                                            Записаться
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="text-center mt-4">
                        <Spinner animation="border" variant="primary" />
                    </div>
                )}

                {!hasMore && services.length > 0 && (
                    <div className="text-center mt-4 text-muted">
                        <small>Больше услуг нет</small>
                    </div>
                )}

                {/* Модалка */}
                <Modal show={showModal} onHide={this.closeModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Запись на услугу</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedService && (
                            <>
                                <p><strong>Услуга:</strong> {selectedService.service.title}</p>
                                <Form onSubmit={this.handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Комментарий</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={note}
                                            onChange={(e) => this.setState({ note: e.target.value })}
                                            placeholder="Например: могу опоздать"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Время</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            value={time}
                                            onChange={(e) => this.setState({ time: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                    {bookingSuccess && <Alert variant="success">{bookingSuccess}</Alert>}
                                    <Button variant="primary" type="submit" disabled={bookingLoading}>
                                        {bookingLoading ? 'Запись...' : 'Подтвердить запись'}
                                    </Button>
                                </Form>
                            </>
                        )}
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

export default withRouter(SpecialistServicesPage);
