import React, { Component, createRef } from 'react';
import {Card, Button, Spinner, Modal, Form} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import OrgService from "../services/org.service";

const ITEMS_PER_PAGE = 10;

export default class OrganizationsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizations: [],
      loading: false,
      hasMore: true,
      page: 1,
      showModal: false,
      form: {
        name: '',
        description: '',
        location: '',
      },
    };
    this.observer = null;
    this.lastCardRef = createRef();
  }

  async componentDidMount() {
    await this.loadMore();
    this.initIntersectionObserver();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
        this.lastCardRef.current &&
        this.state.organizations.length !== prevState.organizations.length
    ) {
      this.initIntersectionObserver();
    }
  }

  initIntersectionObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      if (
          entries[0].isIntersecting &&
          this.state.hasMore &&
          !this.state.loading
      ) {
        this.loadMore();
      }
    });

    if (this.lastCardRef.current) {
      this.observer.observe(this.lastCardRef.current);
    }
  }

  loadMore = async () => {
    try {
      this.setState({ loading: true });

      const { page, organizations } = this.state;
      const res = await OrgService.getPublicContent(page);
      const newOrgs = res.data.items;

      this.setState({
        organizations: [...organizations, ...newOrgs],
        page: page + 1,
        hasMore: newOrgs.length === ITEMS_PER_PAGE,
        loading: false,
      });
    } catch (err) {
      console.error('Ошибка загрузки организаций:', err);
      this.setState({ loading: false, hasMore: false });
    }
  };

  handleShowModal = () => this.setState({ showModal: true });

  handleCloseModal = () => this.setState({
    showModal: false,
    form: { name: '', description: '', location: '' }
  });

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      form: { ...prev.form, [name]: value }
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await OrgService.create(this.state.form);
      this.setState((prev) => ({
        organizations: [res.data, ...prev.organizations],
        showModal: false,
        form: { name: '', description: '', location: '' },
      }));
    } catch (err) {
      console.error('Ошибка создания организации:', err);
    }
  };

  render() {
    const { organizations, loading, hasMore, showModal, form } = this.state;

    return (
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Организации</h2>
            <Button variant="success" onClick={this.handleShowModal}>
              + Добавить
            </Button>
          </div>

          <div className="row g-4">
            {organizations.map((org, index) => (
                <div
                    className="col-md-4"
                    key={org._id}
                    ref={index === organizations.length - 1 ? this.lastCardRef : null}
                >
                  <Card>
                    <Card.Img
                        variant="top"
                        src={`https://eu.ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&size=250`}
                    />
                    <Card.Body>
                      <Card.Title>{org.name}</Card.Title>
                      <Card.Text>{org.description}</Card.Text>
                      <Card.Text className="text-muted">
                        <small>{org.location}</small>
                      </Card.Text>
                      <div className="d-flex flex-wrap gap-2 justify-content-between">
                        <Button
                            variant="primary"
                            as={Link}
                            to={`/services?organization_id=${org._id}`}
                        >
                          Услуги
                        </Button>
                        <Button
                            variant="secondary"
                            as={Link}
                            to={`/specialists?organization_id=${org._id}`}
                        >
                          Специалисты
                        </Button>
                        {org.isOwner && (
                            <Button
                                variant="warning"
                                as={Link}
                                to={`/appointments?organization_id=${org._id}`}
                            >
                              Записи
                            </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
            ))}
          </div>

          {loading && (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary"/>
              </div>
          )}

          {!hasMore && (
              <div className="text-center mt-4 text-muted">
                <small>Больше организаций нет</small>
              </div>
          )}

          <Modal show={showModal} onHide={this.handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Добавить организацию</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label>Название</Form.Label>
                  <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={this.handleChange}
                      required
                  />
                </Form.Group>

                <Form.Group controlId="formDescription" className="mb-3">
                  <Form.Label>Описание</Form.Label>
                  <Form.Control
                      type="text"
                      name="description"
                      value={form.description}
                      onChange={this.handleChange}
                      required
                  />
                </Form.Group>

                <Form.Group controlId="formLocation" className="mb-3">
                  <Form.Label>Локация</Form.Label>
                  <Form.Control
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={this.handleChange}
                      required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={this.handleCloseModal} className="me-2">
                    Отмена
                  </Button>
                  <Button variant="primary" type="submit">
                    Сохранить
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
    );
  }
}
