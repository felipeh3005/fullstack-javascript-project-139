import {
  Button,
  Container,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5 text-center">
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.message')}</p>
      <Button as={Link} to="/" variant="primary">
        {t('notFound.link')}
      </Button>
    </Container>
  );
};

export default NotFoundPage;