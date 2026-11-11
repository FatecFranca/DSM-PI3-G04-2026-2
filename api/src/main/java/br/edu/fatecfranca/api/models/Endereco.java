package br.edu.fatecfranca.api.models;

public class Endereco {
    private String logradouro;
    private String numero;
    private String municipio;
    private String uf;
    private String cep;

    public Endereco() {
    }

    public Endereco(String logradouro, String numero, String municipio, String uf, String cep) {
        this.logradouro = logradouro;
        this.numero = numero;
        this.municipio = municipio;
        this.uf = uf;
        this.cep = cep;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

}