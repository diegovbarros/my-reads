import React from "react"
import * as BooksAPI from '../BooksAPI'
import SearchBook from "../components/SearchBook"
import PropTypes from 'prop-types';
import {transformBook} from "../utils/Util"
import _ from "lodash"
import { pipe } from "../helpers/Helpers"


const propTypes = {
    collection          : PropTypes.func.isRequired,
    onChangeBookShelf   : PropTypes.func.isRequired,
    options             : PropTypes.array.isRequired,
    error               : PropTypes.bool.isRequired,
    onClickAlert        : PropTypes.func.isRequired,
    onErrorOccurred     : PropTypes.func.isRequired
};
/**
* @description 
* Componente statefull responsável por controlar o estado da aplicação referente a página de busca e renderizar
* o componente SearchBook que é responsável pela visualização da busca
* @constructor
* @param {Function} collection          Função que retornará a coleção de livros contidas nas estantes padrões
* @param {Array}    options             Lista de estantes para adição/troca de um livro
* @param {Function} onChangeBookShelf   Função responsável por efetuar a adição/troca do livro para uma estante* 
* @param {Function} onClickAlert        Função reponsável por fechar o Alert de erro
* @param {Function} onErrorOccurred     Função reponsável por abrir o Alert de erro
* @param {boolean}  error               True - Se aconteceu um erro | False - Se não houve um erro
*/
class SearchBookContainer extends React.Component {

    state = { 
        query: "",
        books:[],
        loading : false
    };
    
    /**
    * @description 
    * Efetua uma chamada na API passando o termo contido no parâmetro query, onde a api irá retornar os livros
    * relacionados, atualizando o estado da aplicação com os livros resultantes da chamada
    * 
    * @param   {string} query Termo 
    */
    searchQuery = _.debounce((query) => {
        this.setState({query,loading:true});
        BooksAPI.search(query).then((items) => {
            return Array.isArray(items) ? transformBook(items) : [];
        }).then((books) => {
            const collection   = this.props.collection();
            const intersection = _.intersectionBy(collection, books, 'id');
            books = _.unionBy(intersection,books,'id');
            this.setState({books,loading:false});
        }).catch(() => {
            this.setState({loading:false});
            this.props.onErrorOccurred();
        });
    }, 100);


    /**
    * @description 
    * Efetua a verificação de vazio para o termo contido no parâmetro query, caso seja, atualiza o estado para o valor padrão
    * e retorna a própria query
    * 
    * @param   {string} query Termo 
    *
    * @returns {string} Termo
    */
    isEmpty = (query) => {
        !_.isEmpty(query) || this.setState({query,loading:false,books:[]});
        return query;
    };

    /**
    * @description 
    * Efetua a verificação de não vazio para o termo contido no parâmetro query, caso tenha valor, chama a função responsável
    * pela busca de livros relacionados ao termo
    * 
    * @param   {string} query Termo 
    */
    hasValue = (query) => {
        _.isEmpty(query) || this.searchQuery(query);
    };


    /**
    * @description 
    * Recebe o evento que representa a adição do livro em uma estante e efetua os passos para efetivar essa adição
    * 
    * @param   {Event} event Evento 
    */
    onInputSearchChange = (event) => {
        event.preventDefault();
        const query = event.target.value;
        pipe(this.isEmpty,this.hasValue)(query);
    };
    
    render() {
        return <SearchBook 
                books={this.state.books} 
                options={this.props.options}
                onChangeBookShelf={this.props.onChangeBookShelf}
                onInputSearchChange={this.onInputSearchChange} 
                onClickAlert={this.props.onClickAlert}
                query={this.state.query}
                loading={this.state.loading}
                error={this.props.error}
            />
    }
}

SearchBookContainer.propTypes = propTypes;

export default SearchBookContainer