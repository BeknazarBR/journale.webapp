import React, { Component, createRef } from 'react';
import {Spinner, Card, Alert, Modal, Button} from 'react-bootstrap';
import ServicesService from '../services/services.service';
import { withRouter } from '../utils/withRouter';

const ITEMS_PER_PAGE = 10;

class ServicesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [],
            loading: false,
            hasMore: true,
            error: null,
            page: 1,
            organizationId: null,
            showAddModal: false,
            newService: { title: '', price: '', description: '' },
        };
        this.lastCardRef = createRef();
        this.observer = null;
    }

    async componentDidMount() {
        const searchParams = new URLSearchParams(this.props.location.search);
        const orgId = searchParams.get('organization_id');

        if (!orgId) {
            this.setState({ error: 'Отсутствует organization_id в URL', loading: false });
            return;
        }

        this.setState({ organizationId: orgId }, async () => {
            await this.loadMore();
            this.initObserver();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            this.lastCardRef.current &&
            this.state.services.length !== prevState.services.length
        ) {
            this.initObserver();
        }
    }

    initObserver() {
        if (this.observer) this.observer.disconnect();

        this.observer = new IntersectionObserver(async (entries) => {
            if (
                entries[0].isIntersecting &&
                this.state.hasMore &&
                !this.state.loading
            ) {
                await this.loadMore();
            }
        });

        if (this.lastCardRef.current) {
            this.observer.observe(this.lastCardRef.current);
        }
    }

    loadMore = async () => {
        const { page, organizationId, services } = this.state;

        this.setState({ loading: true });

        try {
            const res = await ServicesService.getByOrg(page, ITEMS_PER_PAGE, organizationId);
            const newServices = res.data.items || res;

            this.setState({
                services: [...services, ...newServices],
                page: page + 1,
                hasMore: newServices.length === ITEMS_PER_PAGE,
                loading: false,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                error: 'Не удалось загрузить услуги',
                loading: false,
                hasMore: false,
            });
        }
    };

    updateNewServiceField = (field, value) => {
        this.setState((prevState) => ({
            newService: { ...prevState.newService, [field]: value },
        }));
    };

    handleAddService = async (e) => {
        e.preventDefault();

        const { newService, organizationId } = this.state;

        try {
            const payload = {
                ...newService,
                organization_id: organizationId,
            };

            const created = await ServicesService.create(payload);

            this.setState((prevState) => ({
                services: [created.data || created, ...prevState.services],
                showAddModal: false,
                newService: { title: '', price: '', description: '' },
            }));
        } catch (err) {
            console.error(err);
            alert('Ошибка при добавлении услуги');
        }
    };


    render() {
        const { services, loading, error, hasMore } = this.state;

        if (error) {
            return (
                <div className="container mt-4">
                    <Alert variant="danger">{error}</Alert>
                </div>
            );
        }

        return (
            <div className="container py-4">
                <Modal
                    show={this.state.showAddModal}
                    onHide={() => this.setState({showAddModal: false})}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить услугу</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.handleAddService}>
                            <div className="mb-3">
                                <label className="form-label">Название</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.newService.title}
                                    onChange={(e) =>
                                        this.updateNewServiceField('title', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Цена</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.newService.price}
                                    onChange={(e) =>
                                        this.updateNewServiceField('price', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Описание</label>
                                <textarea
                                    className="form-control"
                                    value={this.state.newService.description}
                                    onChange={(e) =>
                                        this.updateNewServiceField('description', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-success">
                                Сохранить
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Услуги организации</h2>
                    <Button
                        variant="success"
                        onClick={() => this.setState({showAddModal: true})}
                    >
                        + Добавить
                    </Button>
                </div>
                {services.length === 0 && !loading ? (
                    <Alert variant="info">Услуг пока нет</Alert>
                ) : (
                    <div className="row g-4">
                        {services.map((service, index) => (
                            <div
                                className="col-md-4"
                                key={service._id}
                                ref={index === services.length - 1 ? this.lastCardRef : null}
                            >
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{service.title}</Card.Title>
                                        <Card.Text>{service.description}</Card.Text>
                                        <Card.Text>
                                            <strong>Цена:</strong> {service.price} сом
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="text-center mt-4">
                        <Spinner animation="border" variant="primary"/>
                    </div>
                )}

                {!hasMore && services.length > 0 && (
                    <div className="text-center mt-4 text-muted">
                        <small>Все услуги загружены</small>
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(ServicesPage);
