import React, { Component, createRef } from 'react';
import {Spinner, Card, Alert, Button, Modal, Form} from 'react-bootstrap';
import SpecialistsService from '../services/specialists.service';
import { withRouter } from '../utils/withRouter';
import { Link } from 'react-router-dom';
import * as PropTypes from "prop-types";
import AssignServiceModal from "./assign-serivce.modal";

const ITEMS_PER_PAGE = 10;

function Mo(props) {
    return null;
}

Mo.propTypes = {
    show: PropTypes.func,
    onHide: PropTypes.func,
    centered: PropTypes.bool,
    children: PropTypes.node
};

class SpecialistsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialists: [],
            loading: false,
            hasMore: true,
            error: null,
            page: 1,
            organizationId: null,
            showModal: false,
            fio: '',
            showAssignModal: false,
            currentSpecialistId: null,
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
            this.state.specialists.length !== prevState.specialists.length
        ) {
            this.initObserver();
        }
    }
    handleShowModal = () => this.setState({ showModal: true });
    handleCloseModal = () => this.setState({ showModal: false, fio: "" });
    handleFioChange = (e) => this.setState({ fio: e.target.value });
    handleAddSpecialist = async () => {
        const { fio, organizationId } = this.state;
        if (!fio.trim()) return;
        await SpecialistsService.create({ fio, organization_id: organizationId });
        this.setState({ specialists: [], page: 1, hasMore: true, showModal: false, fio: "" }, this.loadMore);
    };
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
        const { page, organizationId, specialists } = this.state;

        this.setState({ loading: true });

        try {
            const res = await SpecialistsService.getByOrg(page, ITEMS_PER_PAGE, organizationId);
            const newSpecialists = res.data.items || res;

            this.setState({
                specialists: [...specialists, ...newSpecialists],
                page: page + 1,
                hasMore: newSpecialists.length === ITEMS_PER_PAGE,
                loading: false,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                error: 'Не удалось загрузить специалистов',
                loading: false,
                hasMore: false,
            });
        }
    };

    render() {
        const { specialists, loading, error, hasMore } = this.state;

        if (error) {
            return (
                <div className="container mt-4">
                    <Alert variant="danger">{error}</Alert>
                </div>
            );
        }

        return (
            <div className="container py-4">
                <Modal show={this.state.showModal} onHide={this.handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить специалиста</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>ФИО</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите ФИО"
                                value={this.state.fio}
                                onChange={this.handleFioChange}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleCloseModal}>
                            Отмена
                        </Button>
                        <Button variant="primary" onClick={this.handleAddSpecialist}>
                            Сохранить
                        </Button>
                    </Modal.Footer>
                </Modal>
                <AssignServiceModal
                    show={this.state.showAssignModal}
                    onHide={() => this.setState({ showAssignModal: false })}
                    organizationId={this.state.organizationId}
                    onAssign={async ({ service_id, duration }) => {
                        await SpecialistsService.assignService({
                            specialist_id: this.state.currentSpecialistId,
                            service_id,
                            duration,
                        });
                        this.setState({ showAssignModal: false });
                        // Обновить список специалистов/услуг, если надо
                    }}
                />
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Специалисты организации</h2>
                    <Button onClick={this.handleShowModal} variant="success">
                        Добавить специалиста
                    </Button>
                </div>
                {specialists.length === 0 && !loading ? (
                    <Alert variant="info">Специалистов пока нет</Alert>
                ) : (
                    <div className="row g-4">
                        {specialists.map((spec, index) => (
                            <div
                                className="col-md-4"
                                key={spec._id}
                                ref={index === specialists.length - 1 ? this.lastCardRef : null}
                            >
                                <Card>
                                    <Card.Img
                                        variant="top"
                                        src={`https://i.pravatar.cc/250?u=${encodeURIComponent(spec.fio)}`}
                                        alt={spec.fio}
                                    />
                                    <Card.Body>
                                        <Card.Title>{spec.fio}</Card.Title>
                                        <Card.Text>
                                            <small className="text-muted">ID: {spec._id}</small>
                                        </Card.Text>
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                as={Link}
                                                to={`/specialist/services?specialist_id=${spec._id}`}
                                                variant="primary"
                                                size="sm"
                                            >
                                                Услуги
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => this.setState({ showAssignModal: true, currentSpecialistId: spec._id })}
                                            >
                                                Добавить услугу
                                            </Button>
                                        </div>
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

                {!hasMore && specialists.length > 0 && (
                    <div className="text-center mt-4 text-muted">
                        <small>Все специалисты загружены</small>
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(SpecialistsPage);
