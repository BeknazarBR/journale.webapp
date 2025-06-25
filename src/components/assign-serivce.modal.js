import React, { Component, createRef } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import ServiceService from "../services/services.service";

const ITEMS_PER_PAGE = 10;

class AssignServiceModal extends Component {
    state = {
        services: [],
        page: 1,
        hasMore: true,
        loading: false,
        selectedServiceId: "",
        duration: "",
    };

    dropdownRef = createRef();

    componentDidMount() {
        this.loadMore();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.show && this.props.show) {
            // сбросить состояние при открытии
            this.setState(
                {
                    services: [],
                    page: 1,
                    hasMore: true,
                    loading: false,
                    selectedServiceId: "",
                    duration: "",
                },
                () => this.loadMore()
            );
        }
    }

    loadMore = async () => {
        const { page, services, hasMore, loading } = this.state;
        const { organizationId } = this.props;

        if (!hasMore || loading) return;

        this.setState({ loading: true });
        try {
            const res = await ServiceService.getByOrg(page, ITEMS_PER_PAGE, organizationId);
            const newServices = res.data.items || res;

            this.setState({
                services: [...services, ...newServices],
                page: page + 1,
                hasMore: newServices.length === ITEMS_PER_PAGE,
                loading: false,
            });
        } catch (err) {
            console.error(err);
            this.setState({ loading: false, hasMore: false });
        }
    };

    handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 10) {
            this.loadMore();
        }
    };

    handleServiceChange = (e) => this.setState({ selectedServiceId: e.target.value });
    handleDurationChange = (e) => this.setState({ duration: e.target.value });

    handleSubmit = (e) => {
        e.preventDefault();
        const { selectedServiceId, duration } = this.state;
        if (!selectedServiceId || !duration) return;
        this.props.onAssign({
            service_id: selectedServiceId,
            duration: Number(duration),
        });
    };

    render() {
        const { show, onHide } = this.props;
        const { services, loading, selectedServiceId, duration } = this.state;

        return (
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Добавить услугу специалисту</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group className="mb-3" style={{ maxHeight: "200px", overflowY: "auto" }} onScroll={this.handleScroll} ref={this.dropdownRef}>
                            <Form.Label>Услуга</Form.Label>
                            <Form.Select value={selectedServiceId} onChange={this.handleServiceChange} size="10">
                                <option value="">Выберите услугу</option>
                                {services.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.title}
                                    </option>
                                ))}
                            </Form.Select>
                            {loading && (
                                <div className="text-center mt-2">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Длительность (мин.)</Form.Label>
                            <Form.Control type="number" value={duration} onChange={this.handleDurationChange} min={1} required />
                        </Form.Group>

                        <Button variant="success" type="submit" disabled={!selectedServiceId || !duration}>
                            Привязать
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    }
}

export default AssignServiceModal;
