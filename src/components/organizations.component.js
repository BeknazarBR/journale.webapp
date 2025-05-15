import React, { Component, createRef } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import OrgService from "../services/org.service";

const ITEMS_PER_PAGE = 10;

const generateMockOrganizations = (start, count) => {
  return Array.from({ length: count }, (_, i) => {
    const id = start + i;
    return {
      _id: `org-${id}`,
      name: `Organization ${id}`,
      description: `This is a mock description for Organization ${id}.`,
      location: `Location ${id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
};

class OrganizationsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizations: [],
      loading: false,
      hasMore: true,
      page: 1,
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

  render() {
    const { organizations, loading, hasMore } = this.state;

    return (
        <div className="container py-4">
          <h2 className="mb-4">Organizations</h2>
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
                      <div className="d-flex justify-content-between">
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
                      </div>
                    </Card.Body>
                  </Card>
                </div>
            ))}
          </div>

          {loading && (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary" />
              </div>
          )}

          {!hasMore && (
              <div className="text-center mt-4 text-muted">
                <small>Больше организаций нет</small>
              </div>
          )}
        </div>
    );
  }
}

export default OrganizationsPage;
